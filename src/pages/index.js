import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"
import Seo from "../components/seo"

const IndexPage = () => (
  <Layout>
    <Seo title="Home" />
    <h1>Bem vindo</h1>
    <p>Uma ferramenta simples e unificada que realiza auditorias de páginas na Web.</p>
    <StaticImage
      src="../images/intro-illustration.svg"
      width={300}
      quality={90}
      loading="lazy"
      placeholder="none"
      alt="Imagem decorativa de introdução"
    />
  </Layout>
)

export default IndexPage
