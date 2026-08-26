# Authorized Member-Profile Import

The core-member directory intentionally starts with **names, positions, and teams only**. Branch, year, USN, LinkedIn URL, and contact number are optional personal data fields and must only be imported after each member’s consent and the community’s public-display decision have been confirmed.

An administrator can call `community.importMemberProfiles` with profile records matching the exact existing `fullName`. Each record includes the optional detail fields plus three independent visibility flags: `showAcademicDetails`, `showLinkedin`, and `showContactNumber`.

Set a visibility flag to `true` only when the named member has agreed that the corresponding data may appear on the public profile. The public `community.members` response masks any field whose visibility flag is false.
