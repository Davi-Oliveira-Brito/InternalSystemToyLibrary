// Comprime imagem mantendo proporção original — usar em fotos de jogos
export function compressImage(file: File, size = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve) => {
    const img = document.createElement('img')
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let { width, height } = img
      if (width > size || height > size) {
        if (width > height) {
          height = Math.round((height * size) / width)
          width = size
        } else {
          width = Math.round((width * size) / height)
          height = size
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality)
    }
    img.src = url
  })
}

// Comprime e faz crop quadrado centralizado — usar em avatars de perfil
export function compressAvatar(file: File, size = 400, quality = 0.85): Promise<Blob> {
  return new Promise((resolve) => {
    const img = document.createElement('img')
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      const min = Math.min(img.width, img.height)
      const sx = (img.width - min) / 2
      const sy = (img.height - min) / 2
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality)
    }
    img.src = url
  })
}