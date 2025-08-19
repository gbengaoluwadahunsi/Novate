import { NextRequest, NextResponse } from 'next/server'
import { voiceInputService } from '@/lib/voice-input-service'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const section = formData.get('section') as string
    const currentValue = formData.get('currentValue') as string

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Convert File to Blob for processing
    const audioBlob = new Blob([await audioFile.arrayBuffer()], {
      type: audioFile.type
    })

    // Transcribe the audio
    const transcription = await voiceInputService.transcribeAudio(audioBlob)

    if (!transcription || transcription.trim() === '') {
      return NextResponse.json(
        { error: 'No speech detected in audio' },
        { status: 400 }
      )
    }

    // For section-specific updates, we'll return the transcription directly
    // The client will handle updating the specific field
    return NextResponse.json({
      transcription: transcription.trim(),
      section,
      confidence: 0.9 // Simulated confidence score
    })

  } catch (error) {
    // Transcription error
    return NextResponse.json(
      { error: 'Failed to process audio transcription' },
      { status: 500 }
    )
  }
}