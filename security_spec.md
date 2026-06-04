# Security Specification: SaludMar Academy Acreditación

This document outlines the Security Invariants, extreme test payloads ("The Dirty Dozen"), and testing strategies to ensure zero-leak protection of participants data and academic records.

## 1. Data Invariants
- **Participants Invariant**: Only registered/authorized clients can write participant records. Anyone can read their own certificate by document ID, but listing all participants isrestricted to administrator.
- **Layout Config Invariant**: System layouts `/layout/config` defines fonts, watermark status, and styling. Only the examiner authority can modify layout configuration. Standard users can only read it.
- **Signature Config Invariant**: Facilitator/examiner digital signatures in `/signatures/{signatureId}` are immutable or editable strictly by administrator. Standard users can only read them.

## 2. The Dirty Dozen Payloads
Below are 12 malicious payload simulation formats designed to challenge the access permissions of SaludMar:

1. **Spoofed User Registration**: Request to create a participant with a self-assigned status of `"Aceptado"` bypasses waiting approval list.
2. **Ghost Participant Injector**: Creation of a participant document with unauthorized field `fakeField: "hacker"`.
3. **Invalid ID Character Ingress**: Target ID is structured with binary junk or 1.5KB long character attacks to provoke stack exhaustion.
4. **Layout Extinction**: Standard custom request to overwrite layout body text with massive empty strings or null keys.
5. **Unauthorized Signature Hijacking**: Modification of `/signatures/firmante-1` to replace standard credentials with unauthorized data.
6. **Self-signed Certificate Bypass**: standard user tries to directly change `certificadoEmitido = true` and generates fake code without examiner validation.
7. **Cross-Tenant List Scraping**: Standard guest users try to list all registered users across all courses.
8. **Malicious Date Spoofing**: Changing `fechaEmisionCertificado` with a client-side generated fake historical date instead of real current date.
9. **Signature Scale Injection**: Injecting `-9000%` or layout `borderWidth: 999999` to break page visual layouts on printed certificates.
10. **Admin Claim Fraud**: Standard user requests access claiming custom admin properties inside auth token context.
11. **Malicious Participant Overwriter**: Standard student overwrites someone else's document in `/participants/{p-2}`.
12. **Status Progression Short-cutting**: Participant updates `pago` status without financial validation or admin acceptance.

## 3. Test Runner Definition
Verification tests are executed against Firestore Emulator or local rules validator to verify that all operations for standard or malicious payloads described return `PERMISSION_DENIED`.
