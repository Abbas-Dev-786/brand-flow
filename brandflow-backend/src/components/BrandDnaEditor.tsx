"use client"

import { useState } from 'react'
import { BrandDNA } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save, Target, MessageSquare, Palette, ShieldCheck, Zap } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function BrandDnaEditor({ dna, onSave }: { dna: BrandDNA, onSave: (edited: BrandDNA) => Promise<void> }) {
  const [targetAudience, setTargetAudience] = useState(dna.targetAudience)
  const [tone, setTone] = useState(dna.tone.join('\n'))
  const [values, setValues] = useState(dna.values.join('\n'))
  const [visualStyle, setVisualStyle] = useState((dna.visualStyle || []).join('\n'))
  const [keyMessages, setKeyMessages] = useState(dna.keyMessages.join('\n'))
  const [proofPoints, setProofPoints] = useState(dna.proofPoints.join('\n'))

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const editedDna: BrandDNA = {
      targetAudience,
      tone: tone.split('\n').map(s => s.trim()).filter(Boolean),
      values: values.split('\n').map(s => s.trim()).filter(Boolean),
      visualStyle: visualStyle.split('\n').map(s => s.trim()).filter(Boolean),
      keyMessages: keyMessages.split('\n').map(s => s.trim()).filter(Boolean),
      proofPoints: proofPoints.split('\n').map(s => s.trim()).filter(Boolean),
    }
    await onSave(editedDna)
    setSaving(false)
  }

  const labelStyles = "text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block"
  const textareaStyles = "bg-white/50 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-xl transition-all resize-none shadow-inner"

  return (
    <div className="glass rounded-3xl overflow-hidden border-white/40 shadow-2xl relative">
      <div className="p-8 border-b border-slate-100 bg-white/30 flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-slate-900">Fine-tune Brand DNA</h3>
          <p className="text-slate-500 text-sm font-medium">Customize the parameters our AI uses for generation</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-5 h-auto font-bold shadow-lg shadow-indigo-100 btn-premium group"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />}
          Update Changes
        </Button>
      </div>

      <Tabs defaultValue="identity" className="w-full">
        <div className="bg-slate-50/50 px-8 py-2 border-b border-slate-100">
          <TabsList className="bg-transparent gap-6">
            <TabsTrigger value="identity" className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-indigo-600 rounded-none px-0 py-4 font-bold text-slate-500 transition-all">
              <Target className="w-4 h-4 mr-2" /> Identity
            </TabsTrigger>
            <TabsTrigger value="messaging" className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-indigo-600 rounded-none px-0 py-4 font-bold text-slate-500 transition-all">
              <MessageSquare className="w-4 h-4 mr-2" /> Messaging
            </TabsTrigger>
            <TabsTrigger value="style" className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-indigo-600 rounded-none px-0 py-4 font-bold text-slate-500 transition-all">
              <Palette className="w-4 h-4 mr-2" /> Style & Verification
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-8 pb-12">
          <TabsContent value="identity" className="space-y-6 animate-in mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <span className={labelStyles}>🎯 Target Audience</span>
                <Textarea
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  rows={4}
                  className={textareaStyles}
                  placeholder="Describe who your brand serves..."
                />
              </div>
              <div className="space-y-2">
                <span className={labelStyles}>💎 Core Values</span>
                <Textarea
                  value={values}
                  onChange={(e) => setValues(e.target.value)}
                  rows={4}
                  className={textareaStyles}
                  placeholder="What does your brand stand for? (one per line)"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messaging" className="space-y-6 animate-in mt-0">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className={labelStyles}>📢 Primary Key Messages</span>
                <Textarea
                  value={keyMessages}
                  onChange={(e) => setKeyMessages(e.target.value)}
                  rows={4}
                  className={textareaStyles}
                  placeholder="The main things people should know about your brand..."
                />
              </div>
              <div className="space-y-2">
                <span className={labelStyles}>🎭 Brand Voice / Tone</span>
                <Textarea
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  rows={4}
                  className={textareaStyles}
                  placeholder="How does your brand sound? (e.g. Professional, Witty, Calm)"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-6 animate-in mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <span className={labelStyles}>🎨 Visual Style Keywords</span>
                <Textarea
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value)}
                  rows={5}
                  className={textareaStyles}
                  placeholder="Keywords that define your brand look..."
                />
              </div>
              <div className="space-y-2">
                <span className={labelStyles}>📈 Proof Points / RTBs</span>
                <Textarea
                  value={proofPoints}
                  onChange={(e) => setProofPoints(e.target.value)}
                  rows={5}
                  className={textareaStyles}
                  placeholder="Why should people believe your claims? (one per line)"
                />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Decorative Bottom Gradient */}
      <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30" />
    </div>
  )
}
