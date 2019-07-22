import Document, { Html, Head, Main, NextScript } from 'next/document'

class CustomDocument extends Document {
  static async getInitialProps (ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render () {
    return (
      <Html>
        <Head>
          <link rel='preload' as='font' crossOrigin='anonymous' href='https://cdn.jsdelivr.net/font-iropke-batang/1.2/IropkeBatangM.woff' />
          <link rel='stylesheet' href='https://cdn.jsdelivr.net/font-iropke-batang/1.2/font-iropke-batang.css' />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
        <style jsx global>{`
          * { font-family: 'Iropke Batang', serif; }
          body { transition: background-color 0.5s; }
        `}</style>
      </Html>
    )
  }
}

export default CustomDocument