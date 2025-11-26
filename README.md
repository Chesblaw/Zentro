# Zentro

a decentralized news curation and reputation protocol. It transforms news publication, moderation, and reward distribution into transparent, verifiable smart contract processes powered by Ethereum.
 Users publish news, vote, build reputation, and earn token rewards — all enforced by immutable on-chain logic.

---
## ✨ Key Features

- **Decentralized News Publishing:** Users submit verified content directly to smart contracts.
- **Reputation-Driven Governance:** Voting power increases with user reputation and past contributions.
- **Anti-Sybil Voting:** Weighted voting & cooldown periods to reduce spam manipulation.
- **Tokenized Rewards:**  Voters and contributors earn rewards distributed transparently on-chain.
- **Modular Contract System:**  Admin control, user management, news registry, voting engine, and reward module as separate contracts.
- **Auditable History:** All actions — submissions, likes, votes, rewards — are traceable on-chain.
  
---

### Workflow

1. **User Registration**
   - New users register through the User Management contract.
   - Profile & reputation score initialized.

2. **Content Publishing**
   - Registered users publish news with metadata stored on IPFS.
   - Admin contract validates or flags malicious reports.

3. **Voting**
   - Users vote on articles using the Voting Contract.
   - Votes are weighted by reputation score.
   - High-quality content receives better weight and engagement.

4. **Reward Distribution**
   - Smart contract automatically calculates each user’s share.
   - Rewards distributed to:
        - Content creators
        - Accurate voters
        - Top contributors (reputation-based bonuses)
---

## 🧩 Tech Stack
| Layer             | Technologies                                 |
| ----------------- | -------------------------------------------- |
| **Smart Contracts:**      | Hardhat, Solidity, ethers.js, OpenZeppelin |
| **Frontend**       | Next.js 15, TypeScript, Tailwind, Zustand, Starknet.js   |
| **Backend**    | NestJS, TypeORM, PostgreSQL, BullMQ   |
| **Engine**    | Python, FastAPI   |
| **Storage** | IPFS |
| **Blockchain**  | Ethereum / EVM-compatible networks



---

## 🔄 System Architecture & User Flow
```mermaid
flowchart TD
    %% ============ USER LAYER ===============
    subgraph UserFlow[User Flow]
        U1([User Visits Platform])
        U2([User Submits News])
        U3([User Votes on News])
        U4([User Views Reputation])
        U5([User Claims Rewards])
    end
    %% ============ FRONTEND ===============
    subgraph Frontend
        J[News Feed UI]
        K[Submit Content UI]
        L[Voting Interface]
        M[Profile & Reputation Dashboard]
    end
    %% USER → FRONTEND
    U1 --> J
    U2 --> K
    U3 --> L
    U4 --> M
    U5 --> M
    %% FRONTEND → BACKEND GATEWAY
    J --> F
    K --> F
    L --> F
    M --> F
    %% ============ BACKEND LAYER =============
    subgraph Backend
        F[API Gateway]
        G[User Reputation Engine]
        H[Content Indexer]
        I[Reward Calculator Sync]
        X[AI News Engine FastAPI]
        Y[Compliance & Validation Engine]
    end
    %% FRONTEND → BACKEND
    F -- Validate Content --> Y
    F -- AI Classification --> X
    F -- Route Requests --> G
    F -- Send News Metadata --> H
    F -- Reward Sync --> I
    %% BACKEND → STORAGE
    H -- Upload Metadata --> N
    %% BACKEND → SMART CONTRACTS
    F -- Submit User Profile Tx --> B
    F -- Submit News Tx --> C
    F -- Submit Vote Tx --> D
    I -- Distribute Rewards --> E
    G -- Update Reputation Score --> B

    %% ============ SMART CONTRACTS ============
    subgraph Smart_Contracts
        A[Admin Contract]
        B[User Management Contract]
        C[News Management Contract]
        D[Voting Contract]
        E[Reward Distribution Contract]
    end
    A --> B
    B --> C
    C --> D
    D --> E
    %% ============ STORAGE LAYER =============
    subgraph Storage
        N[IPFS]
    end
    %% STORAGE → CONTRACT
    N -- Content Metadata Link --> C
    %% SMART CONTRACT → FRONTEND RETURN
    E --> M
    D --> L
    C --> J
    B --> M



```
## 🏗️ Project Structure

```
Zentro/
├── contracts/                                  # Smart Contracts
│
├── backend/                                    # Server Logic
|
├── engine/                                     # AI
|
├── frontend/                                   # UI
│
└── docs/                                      # Documentation
    ├── architecture.md
    ├── contract_design.md
    ├── sdk_usage.md
    └── api_reference.md

```
---
