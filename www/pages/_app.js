import App, { Container } from 'next/app'
import Head from 'next/head'
import ThemeContext from '../src/contexts/ThemeContext'
import { CookiesProvider, useCookies } from 'react-cookie'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function ThemeWrapper ({ children }) {
  const [cookies, setCookie] = useCookies(['theme'])

  return (
    <>
      <Head>
        <title>디대숲</title>
        // 테마 전환할 때 스타일이 잠깐 깨지는 현상을 방지합니다.
        <link rel='stylesheet' href='https://cdn.jsdelivr.net/gh/kognise/water.css@latest/dist/dark.css' />
        <link rel='stylesheet' href={`https://cdn.jsdelivr.net/gh/kognise/water.css@latest/dist/${cookies.theme || 'light'}.css`} />
      </Head>
      <ThemeContext.Provider value={[cookies.theme, theme => setCookie('theme', theme, { path: '/' })]}>
        { children }
      </ThemeContext.Provider>
      <ToastContainer />
    </>
  )
}

class CustomApp extends App {
  static async getInitialProps ({ Component, ctx }) {
    return {
      pageProps: typeof Component.getInitialProps === 'function'
        ? await Component.getInitialProps(ctx) : {},
      cookies: !process.browser && new (require('universal-cookie'))(ctx.req.headers.cookie)
    }
  }

  render () {
    const { Component, pageProps, cookies } = this.props
    return (
      <Container>
        <CookiesProvider cookies={process.browser ? false : cookies}>
          <ThemeWrapper>
            <Component {...pageProps} />
          </ThemeWrapper>
        </CookiesProvider>
      </Container>
    )
  }
}

export default CustomApp
