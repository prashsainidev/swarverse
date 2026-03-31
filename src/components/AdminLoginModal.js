'use client'
import styles from './AdminLoginModal.module.css'

export default function AdminLoginModal({
  authError,
  authLoading,
  authMessage,
  email,
  password,
  onClose,
  onSubmit,
  onEmailChange,
  onPasswordChange,
}) {
  return (
    <div className={styles.overlay} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Admin login</p>
            <h2 className={styles.title}>Sign in</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose} disabled={authLoading}>
            Close
          </button>
        </div>

        {authError && <div className={styles.notice}>{authError}</div>}
        {authMessage && <div className={`${styles.notice} ${styles.noticeSuccess}`}>{authMessage}</div>}

        <form className={styles.form} onSubmit={onSubmit}>
          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={onEmailChange}
            autoComplete="email"
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={onPasswordChange}
            autoComplete="current-password"
          />
          <div className={styles.actions}>
            <button className={styles.submitButton} type="submit" disabled={authLoading || !password.trim()}>
              {authLoading ? 'Signing in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

