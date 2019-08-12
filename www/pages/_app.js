import PropTypes from 'prop-types'
import App, { Container } from 'next/app'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { CookiesProvider, useCookies } from 'react-cookie'
import { ToastContainer } from 'react-toastify'
import Cookie from 'universal-cookie'
import 'react-toastify/dist/ReactToastify.css'
import ThemeContext from '../src/contexts/ThemeContext'
import axios from '../src/api/axios'

function ThemeWrapper({ children }) {
  const [cookies, setCookie] = useCookies(['theme'])
  const [isLight, setIsLight] = useState(cookies.theme === 'light')

  useEffect(() => {
    setIsLight(cookies.theme === 'light')
  }, [cookies])

  return (
    <>
      <Head>
        <title>디대숲</title>
        // 테마 전환할 때 스타일이 잠깐 깨지는 현상을 방지합니다.
        <link
          rel="stylesheet"
          href={`https://cdn.jsdelivr.net/gh/kognise/water.css@latest/dist/${cookies.theme}.css`}
        />
      </Head>
      <ThemeContext.Provider
        value={[
          cookies.theme,
          theme =>
            setCookie('theme', theme, { path: '/', maxAge: 60 * 60 * 24 * 365 })
        ]}
      >
        {children}
      </ThemeContext.Provider>
      <ToastContainer />
      <style jsx global>{`
        body {
          background: ${isLight ? '#f3f3f3' : '#202b38'};
        }
        input,
        select,
        textarea,
        button {
          background-color: ${isLight ? '#e8f5e9' : '#161f27'};
        }
        button:hover {
          background-color: ${isLight ? '#a5d6a7' : '#324759'};
        }
        .card,
        .modal,
        form {
          background-color: ${isLight ? '#fff' : '#253542'};
        }
      `}</style>
    </>
  )
}

ThemeWrapper.propTypes = {
  children: PropTypes.object
}

class CustomApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const proto = ctx.req
      ? ctx.req.headers['x-forwarded-proto']
      : window.location.protocol.replace(':', '')
    const host = ctx.req
      ? ctx.req.headers['x-forwarded-host'] || ctx.req.headers.host
      : window.location.host
    axios.defaults.baseURL = `${proto}://${host}/`

    return {
      pageProps:
        typeof Component.getInitialProps === 'function'
          ? await Component.getInitialProps(ctx)
          : {},
      cookies: !process.browser && new Cookie(ctx.req.headers.cookie)
    }
  }

  render() {
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
