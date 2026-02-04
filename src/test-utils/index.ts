import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialProps?: Record<string, any>;
}

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: React.ReactElement,
  options?: CustomRenderOptions,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
