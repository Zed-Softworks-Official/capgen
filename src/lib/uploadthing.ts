import { generateReactHelpers, generateUploadDropzone } from '@uploadthing/react'
import type { CapGenFileRouter } from '~/app/api/uploadthing/core'

export const { uploadFiles } = generateReactHelpers<CapGenFileRouter>()
