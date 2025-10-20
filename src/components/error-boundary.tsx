"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleClearCookies = () => {
    window.location.href = "/api/clear-cookies-redirect";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <p className="mb-4">
            You might be experiencing this issue because of a large amount of data in your cookies.
          </p>
          <Button onClick={this.handleClearCookies}>
            Clear Cookies and Redirect
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
