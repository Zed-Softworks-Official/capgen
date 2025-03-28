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
import ColorPicker from '../ui/color-picker'
import { Switch } from '../ui/switch'
import { cn } from '~/lib/utils'
import { Button } from '../ui/button'

export function CaptionSettings() {
    // const { transcript } = useStore(workflowStore)

    const form = useForm({
        defaultValues: {
            wordsPerSpeaker: 5,
            speakers: transcript.utterances.map(
                (u) =>
                    ({
                        id: u.speaker,
                        name: u.speaker,
                        textColor: '#ffffff',
                        borderColor: null,
                        includeInCaption: true as boolean,
                    }) satisfies Speaker
            ),
        },
        onSubmit: (data) => {
            console.log(data)
        },
    })

    return (
        <div className="mx-auto flex max-h-[calc(100vh-10rem)] w-full max-w-xl flex-col gap-4 overflow-y-auto">
            <h2 className="text-2xl font-bold">Caption Editor</h2>

            <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                    e.stopPropagation()
                    e.preventDefault()

                    form.handleSubmit()
                }}
            >
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
                                            <span
                                                className={cn(
                                                    !field.state.value.find(
                                                        (s) => s.id === speaker.id
                                                    )?.includeInCaption &&
                                                        'text-muted-foreground line-through'
                                                )}
                                            >
                                                {speaker.name}
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Speaker Name</Label>
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
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Text Color</Label>
                                                <div className="flex items-center gap-2">
                                                    <ColorPicker
                                                        value={speaker.textColor}
                                                        onChange={(color) =>
                                                            field.handleChange((prev) =>
                                                                prev.map((s) =>
                                                                    s.id === speaker.id
                                                                        ? {
                                                                              ...s,
                                                                              textColor:
                                                                                  color,
                                                                          }
                                                                        : s
                                                                )
                                                            )
                                                        }
                                                    />
                                                    <div
                                                        className="h-4 w-4 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                speaker.textColor,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Include in caption</Label>
                                                <Switch
                                                    checked={speaker.includeInCaption}
                                                    onCheckedChange={(checked) => {
                                                        field.handleChange((prev) =>
                                                            prev.map((s) =>
                                                                s.id === speaker.id
                                                                    ? {
                                                                          ...s,
                                                                          includeInCaption:
                                                                              checked,
                                                                      }
                                                                    : s
                                                            )
                                                        )
                                                    }}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    )}
                </form.Field>

                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                    {([canSubmit, isSubmitting]) => (
                        <Button type="submit" disabled={!canSubmit}>
                            {isSubmitting ? 'Generating...' : 'Generate Captions'}
                        </Button>
                    )}
                </form.Subscribe>
            </form>
        </div>
    )
}
