import BrandLogo from '../../../components/BrandLogo'
import styles from './HeroSection.module.css'
import { ThemeIcon } from './icons'

export default function HeroSection({
  theme,
  isHydrated,
  isAdmin,
  user,
  authLoading,
  saving,
  isTrashShelf,
  supabaseAvailable,
  onGoHome,
  onOpenAdminLogin,
  onSignOut,
  onOpenSongModal,
  onToggleTheme,
}) {
  return (
    <header className={styles.hero}>
      <div className={styles.heroTop}>
        <button type="button" className={styles.logoButton} onClick={onGoHome} aria-label="Go to home">
          <div className={styles.logoArea}>
            <span className={styles.logoIcon}>
              <BrandLogo className={styles.brandImage} priority />
            </span>
            <div>
              <p className={styles.eyebrow}>Personal song space</p>
              <h1 className={styles.logoText}>SwarVerse</h1>
            </div>
          </div>
        </button>

        <div className={styles.quickActions}>
          {isHydrated && !isAdmin && supabaseAvailable && (
            <button className={styles.ghostButton} onClick={onOpenAdminLogin}>
              Login
            </button>
          )}

          {isHydrated && isAdmin && (
            <>
              <button className={styles.ghostButton} onClick={onSignOut} disabled={authLoading}>
                {authLoading ? 'Signing out...' : 'Logout'}
              </button>
              <button className={styles.primaryButton} onClick={onOpenSongModal} disabled={saving || isTrashShelf}>
                Add song
              </button>
            </>
          )}

          <button
            className={styles.iconButton}
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <ThemeIcon theme={theme} />
          </button>
        </div>
      </div>

      <div className={styles.heroBody}>
        <p className={styles.heroLine}>Keep the songs you come back to in one place.</p>
        <p className={styles.heroSubline}>Search fast, open what you need, and keep your favorites close.</p>
        {isAdmin && <p className={styles.accountNote}>Signed in as {user.email}</p>}
      </div>
    </header>
  )
}
