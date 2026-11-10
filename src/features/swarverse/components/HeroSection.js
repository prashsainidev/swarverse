import BrandLogo from '../../../components/BrandLogo'
import styles from './HeroSection.module.css'
import { SparklesIcon, ThemeIcon } from './icons'

export default function HeroSection({
  theme,
  onGoHome,
  onToggleTheme,
}) {
  return (
    <header className={styles.hero}>
      {/* Top Glass Navigation Bar */}
      <nav className={styles.navBar}>
        <button type="button" className={styles.logoButton} onClick={onGoHome} aria-label="Go to home">
          <div className={styles.logoArea}>
            <div className={styles.logoIcon}>
              <BrandLogo className={styles.brandImage} priority />
            </div>
            <div>
              <span className={styles.logoBadge}>Guitar Vault</span>
              <h1 className={styles.logoText}>SwarVerse</h1>
            </div>
          </div>
        </button>

        <div className={styles.quickActions}>
          <button
            className={styles.themeToggleBtn}
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <ThemeIcon theme={theme} />
          </button>
        </div>
      </nav>

      {/* Hero Showcase Area */}
      <div className={styles.heroBody}>
        <div className={styles.pillStat}>
          <SparklesIcon />
          <span>Curated Guitar Chords & Tabs Library</span>
        </div>

        <h2 className={styles.heroHeading}>
          Master your songs with <span className={styles.gradientText}>effortless chords</span>.
        </h2>

        <p className={styles.heroSubline}>
          Your private acoustic & electric library. Explore chord charts across Ultimate Guitar, Wrytin, and Indichords in one seamless vault.
        </p>
      </div>
    </header>
  )
}
