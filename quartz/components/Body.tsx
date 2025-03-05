// @ts-ignore
import clipboardScript from "./scripts/clipboard.inline"
import clipboardStyle from "./styles/clipboard.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Body: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return (
    <div id="quartz-body">
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-2L3L15EQJJ"></script>
      <script>
        window.dataLayer = window.dataLayer || []; function gtag(...args: any[])
        {dataLayer.push(args)}
        gtag('js', new Date()); gtag('config', 'G-2L3L15EQJJ');
      </script>
      {children}
    </div>
  )
}

Body.afterDOMLoaded = clipboardScript
Body.css = clipboardStyle

export default (() => Body) satisfies QuartzComponentConstructor
