"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CampaignInput, CampaignInputSchema } from '@/lib/schemas'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function CampaignForm({ onSubmit, isGenerating }: { onSubmit: (data: CampaignInput) => void, isGenerating: boolean }) {
  const form = useForm<CampaignInput>({
    resolver: zodResolver(CampaignInputSchema),
    defaultValues: {
      goal: '',
      offer: '',
      audience: '',
      channelPreferences: []
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">New Campaign</h2>
          <p className="text-sm text-gray-500">Describe your launch or promotion to generate a campaign pack.</p>
        </div>

        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Goal</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Launch 20% off for new users" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="offer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Offer / Details</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g. 20% off any plan for the first month with code WELCOME20" {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="audience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Audience Override (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Leave blank to use default Brand DNA audience" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isGenerating} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition-all">
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Generate Campaign Pack
        </Button>
      </form>
    </Form>
  )
}
