# Database Schema: MongoDB & Relational Mapping

## 1. MongoDB Document Schemas

### 1.1 `users` Collection
| Field Name | BSON Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Unique document identifier |
| `name` | String | Required | Full name of analyst |
| `email` | String | Required, Unique, Lowercase | Analyst login email address |
| `password` | String | Required | Bcrypt salted hashed password |
| `role` | String | Enum: `['analyst', 'admin', 'auditor']` | Role-based permission level |
| `createdAt`| Date | Default: `Date.now` | User registration timestamp |

### 1.2 `networkevents` Collection
| Field Name | BSON Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Unique event identifier |
| `timestamp` | Date | Required, Indexed | Exact packet arrival timestamp |
| `sourceIP` | String | Required, Indexed | Originating IPv4/IPv6 host |
| `destinationIP` | String | Required, Indexed | Target destination IPv4/IPv6 host |
| `protocol` | String | Required, Indexed | Protocol: TCP, UDP, HTTP, HTTPS, etc. |
| `port` | Number | Required | Destination network port (1-65535) |
| `action` | String | Required | Input symbol (&Sigma;): SYN, LOGIN_FAIL, etc. |
| `status` | String | Enum: `['SAFE', 'SUSPICIOUS']` | Security classification tag |
| `fsmState` | String | Enum: `['START', 'SYN_SENT', ...]` | Resulting FSM state after processing |
| `matchedRule` | String | Nullable | Name of threat rule evaluated |
| `alertTriggered` | String | Nullable, Indexed | Foreign alertId if this event completed attack |
| `batchId` | String | Nullable | Upload batch reference ID |
| `createdAt` | Date | Default: `Date.now` | Record insertion timestamp |

### 1.3 `alerts` Collection
| Field Name | BSON Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Unique document identifier |
| `alertId` | String | Required, Unique, Indexed | Human-readable ID (e.g. `ALT-2026-X82F`) |
| `attackType` | String | Required, Indexed | Attack classification name |
| `ruleId` | String | Required | Internal rule identifier |
| `severity` | String | Enum: `['Critical', 'High', 'Medium', 'Low']` | Risk severity score |
| `timestamp` | Date | Required, Indexed | Detection timestamp |
| `sourceIP` | String | Required, Indexed | Threat actor source IP |
| `destinationIP`| String | Required | Target host |
| `protocol` | String | Required | Transport protocol |
| `port` | Number | Required | Target port |
| `action` | String | Required | Final action that reached accepting state |
| `description` | String | Required | Forensic description of pattern |
| `recommendedAction` | String | Required | Actionable mitigation instructions |
| `stateTrace` | Array of Strings | Required | Full sequence of states traversed |
| `matchedEventsCount` | Number | Default: 0 | Number of packets forming the pattern |
| `status` | String | Enum: `['Active', 'Investigating', 'Resolved']` | Triage workflow state |
| `createdAt` | Date | Default: `Date.now` | Record timestamp |

## 2. Indexing Strategy
- Compound Index: `{ sourceIP: 1, timestamp: -1 }` on `networkevents` for high-throughput session tracking.
- Single Indexes: `{ alertId: 1 }`, `{ severity: 1 }`, `{ attackType: 1 }` on `alerts` for instant sub-millisecond filtering.
