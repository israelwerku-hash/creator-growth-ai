import { describe, it, expect } from 'vitest';
import { userProfileSchema } from '@/lib/validations/user';

describe('Server-Side Zod Validation', () => {
  it('should successfully reject 20 distinct invalid payloads', () => {
    const invalidPayloads = [
      // 1. Missing all fields
      {},
      // 2. Missing name
      { email: "test@example.com", age: 25, aiCredits: 10 },
      // 3. Name too short
      { name: "A", email: "test@example.com", age: 25, aiCredits: 10 },
      // 4. Name too long
      { name: "A".repeat(51), email: "test@example.com", age: 25, aiCredits: 10 },
      // 5. Name wrong type
      { name: 123, email: "test@example.com", age: 25, aiCredits: 10 },
      
      // 6. Missing email
      { name: "John Doe", age: 25, aiCredits: 10 },
      // 7. Malformed email
      { name: "John Doe", email: "not-an-email", age: 25, aiCredits: 10 },
      // 8. Empty email string
      { name: "John Doe", email: "", age: 25, aiCredits: 10 },
      // 9. Email wrong type
      { name: "John Doe", email: 12345, age: 25, aiCredits: 10 },

      // 10. Missing age
      { name: "John Doe", email: "test@example.com", aiCredits: 10 },
      // 11. Age too young (under 13)
      { name: "John Doe", email: "test@example.com", age: 12, aiCredits: 10 },
      // 12. Age too old
      { name: "John Doe", email: "test@example.com", age: 150, aiCredits: 10 },
      // 13. Age not integer
      { name: "John Doe", email: "test@example.com", age: 25.5, aiCredits: 10 },
      // 14. Age wrong type
      { name: "John Doe", email: "test@example.com", age: "25", aiCredits: 10 },

      // 15. Missing aiCredits
      { name: "John Doe", email: "test@example.com", age: 25 },
      // 16. Negative aiCredits
      { name: "John Doe", email: "test@example.com", age: 25, aiCredits: -5 },
      // 17. Non-integer aiCredits
      { name: "John Doe", email: "test@example.com", age: 25, aiCredits: 10.5 },
      // 18. aiCredits wrong type
      { name: "John Doe", email: "test@example.com", age: 25, aiCredits: "10" },

      // 19. Invalid Role enum
      { name: "John Doe", email: "test@example.com", age: 25, aiCredits: 10, role: "SUPER_ADMIN" },
      // 20. Role wrong type
      { name: "John Doe", email: "test@example.com", age: 25, aiCredits: 10, role: 123 },
    ];

    let rejectedCount = 0;

    invalidPayloads.forEach((payload, index) => {
      const result = userProfileSchema.safeParse(payload);
      
      // Assert that every single one failed validation
      expect(result.success, `Payload #${index + 1} incorrectly passed validation!`).toBe(false);
      
      if (!result.success) {
        rejectedCount++;
        // Ensure errors were populated
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    // Final sanity check that all 20 payloads were processed and rejected
    expect(rejectedCount).toBe(20);
  });
});
