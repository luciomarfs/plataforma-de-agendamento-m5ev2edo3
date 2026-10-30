import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, User as UserIcon, Users } from 'lucide-react'
import { Slot } from '@/types/schema'

interface SlotCardProps {
  slot: Slot
  onSelect: (slot: Slot) => void
}

export const SlotCard: React.FC<SlotCardProps> = ({ slot, onSelect }) => {
  const capacidade = slot.quantidade
  const ocupadas = slot.quantidade_utilizada || 0
  const livres = Math.max(0, capacidade - ocupadas)
  const estaCheio = livres === 0
  const percentual = Math.round((ocupadas / capacidade) * 100)

  return (
    <Card
      className={`relative overflow-hidden border transition-all rounded-2xl ${
        estaCheio
          ? 'bg-slate-950/60 border-slate-800/80 opacity-70'
          : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10'
      }`}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
        <div
          className={`h-full ${
            estaCheio ? 'bg-rose-500' : percentual > 70 ? 'bg-amber-500' : 'bg-cyan-400'
          }`}
          style={{ width: `${Math.min(100, percentual)}%` }}
        />
      </div>

      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Badge
              variant="outline"
              className="rounded-full text-[10px] px-2.5 py-0.5 border-cyan-500/30 text-cyan-300 bg-cyan-950/40 mb-1"
            >
              {slot.recurso}
            </Badge>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-1.5 mt-1">
              <Clock className="h-4 w-4 text-cyan-400 shrink-0" />
              {slot.inicio} às {slot.fim}
            </CardTitle>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                estaCheio
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
              }`}
            >
              {estaCheio ? 'Lotado' : `${livres} vagas livres`}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
          <div className="h-7 w-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <UserIcon className="h-3.5 w-3.5" />
          </div>
          <div className="truncate">
            <span className="text-[10px] text-slate-400 block">Profissional / Fisioterapeuta</span>
            <span className="font-medium text-slate-200">
              {slot.expand?.id_profissional?.name || 'Profissional da Unidade'}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Users className="h-3 w-3" />
              Capacidade por sessão:
            </span>
            <span className="font-mono text-slate-300">
              <strong>{ocupadas}</strong> / {capacidade} vagas ocupadas
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all ${
                estaCheio ? 'bg-rose-500' : percentual > 75 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${percentual}%` }}
            />
          </div>
        </div>

        <Button
          disabled={estaCheio}
          onClick={() => onSelect(slot)}
          className={`w-full rounded-full text-xs font-semibold h-9 ${
            estaCheio
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20'
          }`}
        >
          {estaCheio ? 'Sessão Esgotada' : 'Agendar Esta Sessão'}
        </Button>
      </CardContent>
    </Card>
  )
}
