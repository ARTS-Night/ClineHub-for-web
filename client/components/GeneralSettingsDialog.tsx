import { useEffect, useRef } from "react"
import type { Locale, LocaleOption, TFunction } from "../lib/i18n.js"

type Props = {
  t: TFunction
  open: boolean
  onClose: () => void
  locale: Locale
  onChangeLocale: (locale: Locale) => void
  availableLocales: LocaleOption[]
  theme: "dark" | "light"
  onToggleTheme: () => void
  hidePlanBanner: boolean
  onChangeHidePlanBanner: (value: boolean) => void
}

export function GeneralSettingsDialog(props: Props) {
  const { t, open, onClose, locale, onChangeLocale, availableLocales, theme, onToggleTheme, hidePlanBanner, onChangeHidePlanBanner } = props
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close() }, [open])

  return <dialog ref={dialog} className="react-agent-dialog" onClose={onClose}><div className="settings-form">
    <div className="setup-heading"><div><h1>{t("generalSettings")}</h1><p>{t("generalSettingsDescription")}</p></div><button className="secondary icon-button" type="button" onClick={() => dialog.current?.close()} aria-label={t("close")}>×</button></div>
    <label><span>{t("language")}</span>
      <select value={locale} onChange={(event) => onChangeLocale(event.target.value)}>
        {availableLocales.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}
      </select>
    </label>
    <label className="check-row"><input type="checkbox" checked={theme === "light"} onChange={onToggleTheme} /><span>{t(theme === "dark" ? "switchLight" : "switchDark")}</span></label>
    <label className="check-row"><input type="checkbox" checked={!hidePlanBanner} onChange={(event) => onChangeHidePlanBanner(!event.target.checked)} /><span>{t("planBannerSetting")}</span></label>
    <small>{t("planBannerSettingHelp")}</small>
    <a
  href="https://www.buymeacoffee.com/artspg01l"
  target="_blank"
  rel="noopener noreferrer"
>
  <img
    src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
    alt="Buy Me a Coffee"
    style={{ height: '60px', width: '217px' }}
  />
</a>
  </div></dialog>
}
