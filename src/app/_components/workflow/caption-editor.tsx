'use client'

import { useStore } from '@tanstack/react-store'
import { useForm } from '@tanstack/react-form'

import { workflowStore } from '~/lib/store'
import type { Speaker } from '~/lib/types'
import { transcript } from '~/lib/test'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { z } from 'zod'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../ui/accordion'

export function CaptionEditor() {
    // const { transcript } = useStore(workflowStore)

    const form = useForm({
        defaultValues: {
            wordsPerSpeaker: 5,
            speakers: transcript.utterances.map(
                (u) =>
                    ({
                        id: u.speaker,
                        name: u.speaker,
                        textColor: '#000000',
                        borderColor: null,
                    }) satisfies Speaker
            ),
        },
        onSubmit: (data) => {
            console.log(data)
        },
    })

    return (
        <div className="flex max-h-[calc(100vh-10rem)] w-full max-w-xl flex-col gap-4 overflow-y-auto">
            <h2 className="text-2xl font-bold">Caption Editor</h2>

            <form className="flex flex-col gap-4">
                <form.Field
                    name="wordsPerSpeaker"
                    validators={{ onChange: z.number().min(1).max(50) }}
                >
                    {(field) => (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor={field.name}>Words per speaker</Label>
                            <Input
                                type="number"
                                name={field.name}
                                value={field.state.value}
                                onChange={(e) => {
                                    if (e.currentTarget.value === '') {
                                        field.handleChange(0)
                                        return
                                    }

                                    field.handleChange(e.currentTarget.valueAsNumber)
                                }}
                            />
                        </div>
                    )}
                </form.Field>

                <form.Field name="speakers">
                    {(field) => (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor={field.name}>Speakers</Label>
                            <Accordion type="single" collapsible className="w-full">
                                {field.state.value.map((speaker) => (
                                    <AccordionItem key={speaker.id} value={speaker.id}>
                                        <AccordionTrigger>
                                            {speaker.name}
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <Input
                                                type="text"
                                                name={speaker.id}
                                                placeholder={`Speaker Name`}
                                                value={speaker.name}
                                                onChange={(e) => {
                                                    field.handleChange((prev) =>
                                                        prev.map((s) =>
                                                            s.id === speaker.id
                                                                ? {
                                                                      ...s,
                                                                      name: e
                                                                          .currentTarget
                                                                          .value,
                                                                  }
                                                                : s
                                                        )
                                                    )
                                                }}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    )}
                </form.Field>
            </form>
        </div>
    )
}
