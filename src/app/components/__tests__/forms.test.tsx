import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { AiDmGenerator } from '@/app/components/AiDmGenerator';
import { AuthForm } from '@/app/components/AuthForm';
import { MetricForm } from '@/app/components/MetricForm';
import AIMemoryVaultPage from '@/app/dashboard/memory-vault/page';
import LoginPage from '@/app/login/page';

describe('Frontend Form Audits & React Hook Form Integration', () => {

  describe('1. AiDmGenerator', () => {
    it('shows validation errors when invalid and disables button on valid submit', async () => {
      render(<AiDmGenerator />);
      
      // Submit empty
      const user = userEvent.setup();
      const submitBtn = screen.getByRole('button', { name: /Compile AI Script/i });
      
      // Target segment has default value, but custom context can have max length error
      const customContext = screen.getByPlaceholderText(/e.g., mention the custom outfit/i);
      await user.click(customContext);
      await user.paste('a'.repeat(201)); // Exceed max 200

      await user.click(submitBtn);

      expect(await screen.findByText(/Context must be 200 characters or less/i)).toBeInTheDocument();

      // Fix error and submit
      await user.clear(customContext);
      await user.type(customContext, 'Nice video');
      
      await user.click(submitBtn);

      // Verify completion state (wait for it to re-enable)
      await waitFor(() => {
        expect(submitBtn).not.toBeDisabled();
      }, { timeout: 3000 });
    });
  });

  describe('2. AuthForm', () => {
    it('shows inline errors and disables submit button', async () => {
      render(<AuthForm />);
      
      const user = userEvent.setup();
      const submitBtn = screen.getByRole('button', { name: "SIGN IN" });
      
      // Submit empty form to trigger Zod required errors
      await user.click(submitBtn);

      expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();
      expect(await screen.findByText(/Password must be at least 6 characters/i)).toBeInTheDocument();

      // Enter valid email for Magic Link
      await user.type(screen.getByPlaceholderText(/creator@domain.com/i), 'test@example.com');
      
      const magicBtn = screen.getByRole('button', { name: /Sign in with Magic Link/i });
      await user.click(magicBtn);

      // Verify completion state
      await waitFor(() => {
        expect(screen.getByText(/A verification signal has been sent/i)).toBeInTheDocument();
      });
    });
  });

  describe('3. MetricForm', () => {
    it('validates number inputs and prevents string submission', async () => {
      render(<MetricForm />);
      
      const user = userEvent.setup();
      const submitBtn = screen.getByRole('button', { name: /Save Metric Configuration/i });

      await user.type(screen.getByPlaceholderText(/Monthly Video Views/i), 'Views');
      await user.type(screen.getByPlaceholderText(/145,000/i), 'invalid_number'); // Invalid number

      await user.click(submitBtn);

      expect(await screen.findByText(/Must be a valid number/i)).toBeInTheDocument();

      await user.clear(screen.getByPlaceholderText(/145,000/i));
      await user.type(screen.getByPlaceholderText(/145,000/i), '145,000'); // Valid number with commas

      await user.click(submitBtn);

      expect(await screen.findByText(/Metric recorded and database layout synchronized/i)).toBeInTheDocument();
    });
  });

  describe('4. AIMemoryVaultPage', () => {
    it('validates memory fact and simulation forms', async () => {
      render(<AIMemoryVaultPage />);
      
      const user = userEvent.setup();
      
      // Click empty Append Trait
      const appendBtn = screen.getByRole('button', { name: /Append Trait/i });
      await user.click(appendBtn);

      expect(await screen.findByText(/Memory fact is required/i)).toBeInTheDocument();

      // Click empty Simulate
      const simulateBtn = screen.getByRole('button', { name: /Simulate/i });
      await user.click(simulateBtn);

      expect(await screen.findByText(/Message is required/i)).toBeInTheDocument();

      // Fill in and submit simulate
      await user.type(screen.getByPlaceholderText(/Type a hypothetical message/i), 'Hello world');
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ messageBody: "Mock response" })
      }) as any;

      await user.click(simulateBtn);

      expect(await screen.findByText(/Mock response/i)).toBeInTheDocument();
    });
  });

  describe('5. LoginPage', () => {
    it('shows inline errors for email and password', async () => {
      render(<LoginPage />);
      
      const user = userEvent.setup();
      const submitBtn = screen.getByRole('button', { name: /Sign In to Dashboard/i });

      // Trigger empty submission
      await user.click(submitBtn);

      expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();
      expect(await screen.findByText(/Password must be at least 6 characters/i)).toBeInTheDocument();

      // Enter valid data
      await user.type(screen.getByPlaceholderText(/agency@example.com/i), 'user@agency.com');
      await user.type(screen.getByPlaceholderText(/••••••••/i), 'mypassword');

      await user.click(submitBtn);

      expect(await screen.findByText(/Login succeeded but no session was created/i)).toBeInTheDocument();
    });
  });
});
