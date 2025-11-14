import { Component, ReactNode } from "react";

/**
 * Error boundary for animation components
 * Requirements: 5.1, 5.2
 * Prevents animation errors from crashing the entire app
 */

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AnimationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error("Animation error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return fallback or null to gracefully handle animation failures
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}
