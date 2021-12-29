import fontkit from '@pdf-lib/fontkit'
import { saveAs } from 'file-saver'
import { PDFDocument } from 'pdf-lib'
import React, { useEffect, useRef, useState } from 'react'
import { DropzoneInputProps, useDropzone } from 'react-dropzone'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.js`

export default function FilePicker(props: DropzoneInputProps) {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone()

  const [pdfDoc, setPdfDoc] = useState<PDFDocument | undefined>()
  const [outputDoc, setOutputDoc] = useState<Uint8Array | undefined>()
  const [customFont, setCustomFont] = useState()

  //FOR PDF VIEWER
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const canvasRef = useRef(null)

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
  }

  async function addTextToDocumentAndSave() {
    const doc = pdfDoc
    if (!doc) {
      return
    }
    // modify file
    const page = doc.getPage(0)
    // Get the width and height of the first page
    const { width, height } = page.getSize()

    page.drawText('Hello World Signed', {
      x: width / 2,
      y: height / 2,
      size: 20,
      font: customFont,
    })

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await doc.save()
    const jFile = new File([pdfBytes], 'jamestest.pdf')
    saveAs(jFile)
  }

  useEffect(() => {
    const handleDocs = async () => {
      const [theFile] = acceptedFiles
      const fileBytes = await theFile.arrayBuffer()
      const doc = await PDFDocument.load(fileBytes)

      // Register the `fontkit` instance
      doc.registerFontkit(fontkit)

      const fontResponse = await fetch(
        'https://fonts.gstatic.com/s/licorice/v1/t5tjIR8TMomTCAyjNn2wjKPCzzHv.woff2'
      )
      const fontBytes = await fontResponse.arrayBuffer()
      // Embed our custom font in the document
      const localCustomFont = await doc.embedFont(fontBytes)
      doc.registerFontkit(fontkit)
      setPdfDoc(doc)
      setOutputDoc(fileBytes)
      setCustomFont(localCustomFont)
    }
    if (acceptedFiles.length > 0) {
      handleDocs()
    }
  }, [acceptedFiles])

  useEffect(() => {
    const canvas = canvasRef?.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) {
      console.log('SOMETHING IS NULL')
      return
    }

    function getMousePos(canvas, evt) {
      var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height // relationship bitmap vs. element for Y

      return {
        x: (evt.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
        y: (evt.clientY - rect.top) * scaleY, // been adjusted to be relative to element
      }
    }

    // TEsting clicks to move text
    //https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
    // canvas.addEventListener('click', function (event: any) {
    //   console.log('EVENT', event)
    //   const { x, y } = getMousePos(canvas, event)
    //   console.log('x: ' + x + ' y: ' + y)
    //   context.clearRect(0, 0, canvas.width, canvas.height)
    //   context.fillStyle = '#000000'
    //   context.fillRect(x, y, 100, 100)
    // })
  }, [])

  const files = acceptedFiles.map((file: File) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ))

  return (
    <section className="container">
      <div style={{ backgroundColor: 'gray', maxWidth: 400, width: '90vw' }}>
        {outputDoc && (
          <Document
            file={{ data: outputDoc }}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={console.error}
            canvas
          >
            <Page width={400} pageNumber={pageNumber} />
          </Document>
        )}
        <canvas ref={canvasRef} style={{ maxWidth: 400, width: 600 }} />
      </div>
      <p>
        Page {pageNumber} of {numPages}
      </p>
      <button onClick={addTextToDocumentAndSave}>Add Text and Save</button>
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>{files}</ul>
      </aside>
    </section>
  )
}
