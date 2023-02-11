import type { ChangeEvent } from "react";
import { useCallback } from "react";
import { useRef } from "react";
import { useState } from "react";
import type { Area } from "react-easy-crop";
import Cropper from "react-easy-crop";
import { Button, CatchContainer, ErrorContainer, FlexList } from "~/components";
import getCroppedImg from "~/utils/croppedImage";

export default function EditBandAvatarImage() {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [image, setImage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [croppedImage, setCroppedImage] = useState<string>()

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) { return }
    setImage(URL.createObjectURL(e.target.files[0]))
  }

  const onCropComplete = useCallback(async (croppedArea: Area, croppedAreaPixels: Area) => {
    try {
      const croppedImage = await getCroppedImg(
        image,
        croppedAreaPixels
      )
      if (!croppedImage) { return }

      setCroppedImage(croppedImage)
    } catch (e) {
      console.error(e)
    }
  }, [image])
  return (
    <FlexList pad={4}>
      {image ? (
        <>
          <div className="relative h-64">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1 / 1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <input
            type="range"
            className="range"
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
          />
          <Button isOutline onClick={() => fileInputRef.current?.click()}>Replace image</Button>
        </>
      ) : (
        <span>Max size: 10MB</span>
      )}
      <input hidden type="hidden" name="intent" defaultValue="image" />
      <input ref={fileInputRef} className="file-input file-input-bordered" hidden={!!image} type="file" accept="image/*" onChange={onImageChange} />
      <input name="path" accept="image/*" defaultValue={croppedImage} type="file" />
    </FlexList>
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}