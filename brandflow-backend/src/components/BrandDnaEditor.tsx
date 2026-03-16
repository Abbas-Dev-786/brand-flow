"use client"

import { useState } from 'react'
import { BrandDNA } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save } from 'lucide-react'

export function BrandDnaEditor({ dna, onSave }: { dna: BrandDNA, onSave: (edited: BrandDNA) => Promise<void> }) {
  // Use local string states for textareas so the user can freely type spaces and newlines
  const [targetAudience, setTargetAudience] = useState(dna.targetAudience)
  const [tone, setTone] = useState(dna.tone.join('\n'))
  const [values, setValues] = useState(dna.values.join('\n'))
  const [visualStyle, setVisualStyle] = useState((dna.visualStyle || []).join('\n'))
  const [keyMessages, setKeyMessages] = useState(dna.keyMessages.join('\n'))
  const [proofPoints, setProofPoints] = useState(dna.proofPoints.join('\n'))

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)

    // Convert string states back to arrays
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

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="text-2xl font-bold mb-4">Edit Brand DNA</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">🎯 Target Audience</label>
          <Textarea
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">🎭 Tone (one per line)</label>
          <Textarea
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">💎 Values (one per line)</label>
          <Textarea
            value={values}
            onChange={(e) => setValues(e.target.value)}
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">🎨 Visual Style (one per line)</label>
          <Textarea
            value={visualStyle}
            onChange={(e) => setVisualStyle(e.target.value)}
            rows={4}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-gray-700">📢 Key Messages (one per line)</label>
          <Textarea
            value={keyMessages}
            onChange={(e) => setKeyMessages(e.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-gray-700">📈 Proof Points (one per line)</label>
          <Textarea
            value={proofPoints}
            onChange={(e) => setProofPoints(e.target.value)}
            rows={3}
          />
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Edits
        </Button>
      </div>
    </div>
  )
}
