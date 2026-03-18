"use client"

import { CampaignPack } from '@/lib/schemas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Sparkles, Mail, Image as ImageIcon, Share2, Send, Linkedin, Twitter } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CampaignPackPreview({ pack }: { pack: CampaignPack }) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // In a real app, use a toast here
  }

  const cardStyles = "glass rounded-3xl overflow-hidden border-white/40 shadow-xl transition-all hover:shadow-2xl h-full"
  const headerStyles = "bg-white/40 border-b border-white/20 p-6 flex justify-between items-center"
  const titleStyles = "text-sm font-black uppercase tracking-widest flex items-center gap-2"
  const labelStyles = "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block"

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">AI Generated Pack</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Campaign Assets</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl font-bold gap-2">
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold gap-2 shadow-lg shadow-indigo-100">
            <Send className="w-4 h-4" /> Export All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="social" className="w-full">
        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-auto gap-1 mb-8">
          <TabsTrigger value="social" className="rounded-xl px-8 py-3 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Social Media
          </TabsTrigger>
          <TabsTrigger value="email" className="rounded-xl px-8 py-3 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email Draft
          </TabsTrigger>
          <TabsTrigger value="visuals" className="rounded-xl px-8 py-3 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Visual Assets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="space-y-8 animate-in mt-0">
          <div className="grid grid-cols-1 gap-8">
            <Card className={cardStyles}>
              <div className={headerStyles}>
                <span className={`${titleStyles} text-blue-600`}>
                  <Linkedin className="w-4 h-4" /> LinkedIn Post
                </span>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(pack.linkedinPost)} className="rounded-full hover:bg-white/50">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <CardContent className="p-8">
                <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap select-all">
                  {pack.linkedinPost}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pack.xPosts.map((post, i) => (
                <Card key={i} className={cardStyles}>
                  <div className={headerStyles}>
                    <span className={`${titleStyles} text-slate-900`}>
                      <Twitter className="w-4 h-4" /> X Variant {i + 1}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(post)} className="h-8 w-8 p-0 rounded-full hover:bg-white/50">
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-slate-800 whitespace-pre-wrap select-all leading-relaxed">
                      {post}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="email" className="animate-in mt-0">
          <Card className={cardStyles}>
            <div className={`${headerStyles} bg-amber-50/10`}>
              <span className={`${titleStyles} text-amber-700`}>
                <Mail className="w-4 h-4" /> Professional Email Draft
              </span>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(pack.email.bodyText)} className="rounded-xl font-bold bg-white/50 hover:bg-white border-white/40">
                <Copy className="w-4 h-4 mr-2" /> Copy Full Text
              </Button>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-2">
                <span className={labelStyles}>Subject Line</span>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <span className="font-bold text-lg text-slate-900">{pack.email.subject}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(pack.email.subject)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <span className={labelStyles}>Email Body</span>
                <div className="whitespace-pre-wrap text-slate-700 font-medium leading-[1.8] bg-white/50 p-8 rounded-2xl border border-slate-100 shadow-inner select-all">
                  {pack.email.bodyText}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visuals" className="space-y-8 animate-in mt-0">
          {pack.primaryImageUrl && (
            <Card className={`${cardStyles} border-indigo-200/50 overflow-hidden`}>
              <div className={`${headerStyles} bg-indigo-50/20`}>
                <span className={`${titleStyles} text-indigo-700`}>
                  <ImageIcon className="w-4 h-4 font-bold" /> Generated Visual Asset
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(pack.primaryImageUrl!, '_blank')}
                  className="rounded-xl font-bold bg-white/50 hover:bg-white border-white/40"
                >
                  View Full Size
                </Button>
              </div>
              <CardContent className="p-0 flex justify-center bg-slate-100/50">
                <div className="relative group w-full max-w-2xl aspect-square">
                  <img 
                    src={pack.primaryImageUrl} 
                    alt="Campaign Asset" 
                    className="w-full h-full object-cover shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <p className="text-white text-sm font-medium italic line-clamp-2">
                       {pack.primaryImagePrompt}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className={`${cardStyles} border-indigo-200/50`}>
            <div className={`${headerStyles} bg-indigo-50/20`}>
              <span className={`${titleStyles} text-indigo-700`}>
                <ImageIcon className="w-4 h-4 font-bold" /> Primary Image AI Prompt
              </span>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(pack.primaryImagePrompt)} className="rounded-xl font-bold bg-white/50 hover:bg-white border-white/40">
                <Copy className="w-4 h-4 mr-2" /> Copy Prompt
              </Button>
            </div>
            <CardContent className="p-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white p-6 rounded-2xl border border-indigo-100/50 italic text-slate-700 font-medium leading-relaxed">
                  "{pack.primaryImagePrompt}"
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pack.imageUrls && pack.imageUrls.length > 0 ? (
              pack.imageUrls.map((url, i) => (
                <div key={i} className={`${cardStyles} group`}>
                   <div className="relative aspect-square bg-slate-100">
                    <img src={url} alt={`Variant ${i+1}`} className="w-full h-full object-cover" />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.open(url, '_blank')}
                      className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Variant {i+1}</span>
                    <p className="text-xs font-medium text-slate-500 italic leading-relaxed line-clamp-2 mt-2">
                       {pack.imagePrompts[i] || "AI Image Variant"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              pack.imagePrompts.slice(0, 3).map((prompt, i) => (
                <div key={i} className="glass p-6 rounded-2xl flex flex-col gap-4 border-white/20 group">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Variant {i+1}</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(prompt)} className="h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-xs font-medium text-slate-500 italic leading-relaxed line-clamp-4">{prompt}</p>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
