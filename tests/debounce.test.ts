import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '@/lib/debounce';

describe('Debounce Utility under Heavy Load', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should only execute the callback once after 100 rapid calls', () => {
    const mockCallback = vi.fn();
    const delay = 300;
    const debouncedFunction = debounce(mockCallback, delay);

    // Simulate 100 rapid function calls (e.g., rapid keystrokes)
    for (let i = 0; i < 100; i++) {
      debouncedFunction(`call ${i}`);
      // Advance time by 5ms for each call, meaning the debounce delay is continually reset.
      vi.advanceTimersByTime(5);
    }

    // Total time elapsed: 100 * 5ms = 500ms.
    // However, the longest gap without a call was only 5ms. 
    // Therefore, the 300ms debounce delay has not yet completed uninterrupted.
    expect(mockCallback).not.toHaveBeenCalled();

    // Now, let the remaining delay (300ms) elapse uninterrupted after the final call
    vi.advanceTimersByTime(delay);

    // The callback should execute exactly once!
    expect(mockCallback).toHaveBeenCalledTimes(1);
    
    // The callback should receive the arguments from the very last invocation
    expect(mockCallback).toHaveBeenCalledWith('call 99');
  });
});
