import Document, { Html, Head, Main, NextScript } from 'next/document'

class CustomDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=UA-128564038-3`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'UA-128564038-3');
          `
            }}
          />
          <link
            rel="preload"
            as="font"
            crossOrigin="anonymous"
            href="https://cdn.jsdelivr.net/font-iropke-batang/1.2/IropkeBatangM.woff"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/font-iropke-batang/1.2/font-iropke-batang.css"
          />
          <link
            href="//spoqa.github.io/spoqa-han-sans/css/SpoqaHanSans-kr.css"
            rel="stylesheet"
            type="text/css"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
        <style jsx global>{`
          * {
            font-family: 'Iropke Batang', serif;
          }
          body {
            transition: background-color 0.5s;
          }
        `}</style>
      </Html>
    )
  }
}

export default CustomDocument
