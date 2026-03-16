"use client"

import { CampaignPack } from '@/lib/schemas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Sparkles, Mail, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CampaignPackPreview({ pack }: { pack: CampaignPack }) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-purple-500 w-6 h-6" />
        <h2 className="text-2xl font-bold">Campaign Pack</h2>
      </div>

      <Tabs defaultValue="social" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="social" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Social Posts</TabsTrigger>
          <TabsTrigger value="email" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Email</TabsTrigger>
          <TabsTrigger value="visuals" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Visuals</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader className="bg-blue-50/50 rounded-t-xl border-b pb-4">
              <CardTitle className="text-lg text-blue-800 flex justify-between items-center">
                LinkedIn Post
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(pack.linkedinPost)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 whitespace-pre-wrap text-gray-700">
              {pack.linkedinPost}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pack.xPosts.map((post, i) => (
              <Card key={i}>
                <CardHeader className="bg-gray-50/50 rounded-t-xl border-b pb-3">
                  <CardTitle className="text-sm font-semibold flex justify-between items-center text-gray-700">
                    X Variant {i + 1}
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(post)} className="h-8 w-8 p-0">
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 text-sm text-gray-800 whitespace-pre-wrap">
                  {post}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader className="bg-amber-50/50 rounded-t-xl border-b pb-4">
              <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                <Mail className="w-5 h-5" /> Email Draft
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex flex-col gap-1 border-b pb-4">
                <span className="text-sm text-gray-500 font-medium">Subject</span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">{pack.email.subject}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(pack.email.subject)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Body</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(pack.email.bodyText)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="whitespace-pre-wrap text-gray-700 font-serif leading-relaxed bg-gray-50 p-4 rounded-md border">
                  {pack.email.bodyText}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visuals" className="space-y-4">
          <Card className="border-indigo-200 shadow-md">
            <CardHeader className="bg-indigo-50/50 rounded-t-xl border-b pb-4">
              <CardTitle className="text-lg text-indigo-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" /> Primary Image Prompt
                </div>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(pack.primaryImagePrompt)}>
                  <Copy className="w-4 h-4 mr-2" /> Copy Prompt
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-gray-700 italic border-l-4 border-indigo-400 ml-4 my-4 pl-4">
              "{pack.primaryImagePrompt}"
            </CardContent>
          </Card>

          <div className="space-y-3 mt-6">
            <h4 className="font-medium text-gray-700 text-sm uppercase tracking-wider">Alternative Prompts</h4>
            {pack.imagePrompts.map((prompt, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-lg border bg-gray-50 items-start">
                <span className="bg-gray-200 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-gray-600 flex-1">{prompt}</p>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(prompt)} className="shrink-0 h-8 w-8 p-0">
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
