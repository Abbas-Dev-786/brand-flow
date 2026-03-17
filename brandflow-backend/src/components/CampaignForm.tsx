"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CampaignInput, CampaignInputSchema } from '@/lib/schemas'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, Target, Gift, Users } from 'lucide-react'

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

  const labelStyles = "text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2"
  const inputStyles = "bg-white/50 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-xl transition-all h-12 shadow-sm"
  const textareaStyles = "bg-white/50 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-xl transition-all resize-none shadow-sm"

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="glass p-8 rounded-3xl space-y-8 shadow-2xl border-white/40">
        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="goal"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel className={labelStyles}>
                  <Target className="w-3.5 h-3.5 text-indigo-500" /> What's the main goal?
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Launch 20% off for new users" {...field} className={inputStyles} />
                </FormControl>
                <FormMessage className="text-[10px] font-bold mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="offer"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel className={labelStyles}>
                  <Gift className="w-3.5 h-3.5 text-purple-500" /> Key Offer / Details
                </FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g. 20% off any plan for the first month with code WELCOME20" {...field} rows={4} className={textareaStyles} />
                </FormControl>
                <FormMessage className="text-[10px] font-bold mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="audience"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel className={labelStyles}>
                  <Users className="w-3.5 h-3.5 text-slate-400" /> Specific Audience (Optional)
                </FormLabel>
                <FormControl>
                  <Input placeholder="Leave blank to use default Brand DNA audience" {...field} className={inputStyles} />
                </FormControl>
                <FormMessage className="text-[10px] font-bold mt-1" />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isGenerating} 
          className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-100 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 btn-premium"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          {isGenerating ? "AI is crafting..." : "Generate Campaign Pack"}
        </Button>
      </form>
    </Form>
  )
}
