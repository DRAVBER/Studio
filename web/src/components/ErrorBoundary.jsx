import { Component } from 'react';
export class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('[web]', error); }
  render() {
    if (this.state.failed) return <main className="fatal-error"><h1>Не удалось открыть страницу</h1>
      <p>Попробуйте загрузить её ещё раз.</p><button className="btn btn-solid" onClick={() => location.reload()}>Перезагрузить</button></main>;
    return this.props.children;
  }
}
