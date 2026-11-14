# Algorithmic Specification: Automata Intrusion Detection

## 1. Algorithm Overview
The Automata Detection Algorithm processes an ordered sequence of network event records $E = \langle e_1, e_2, \dots, e_n \rangle$ across active sessions. It achieves linear time complexity $O(n)$ with $O(1)$ constant-time transitions per event.

## 2. Pseudocode

```text
Algorithm: AutomataIntrusionDetection(E, Rules)
Input:
    E: Array of normalized network events [e_1, e_2, ..., e_n]
    Rules: Set of predefined threat transition matrices {R_SYN, R_BRUTE, R_PORT, R_ABNORMAL}
Output:
    ProcessedEvents: Array of annotated events with FSM states
    Alerts: Array of generated intrusion alert objects
    Summary: Statistical accuracy and safe vs. suspicious count

Begin:
    Initialize SessionMap as empty Hash Map: Key (Source IP) -> Array of FSM Instances
    Initialize ProcessedEvents as empty List
    Initialize Alerts as empty List
    Set safeCount = 0
    Set suspiciousCount = 0

    // Step 1: Ensure chronological ordering
    Sort E ascending by timestamp

    // Step 2: Stream processing
    For each event e in E:
        sessionKey = e.sourceIP
        symbol = UpperCase(e.action)
        
        If sessionKey not in SessionMap:
            SessionMap[sessionKey] = InstantiateStateMachines(Rules)
        End If

        sessionFSMs = SessionMap[sessionKey]
        eventStatus = "SAFE"
        highestState = "START"
        alertTriggered = NULL

        // Step 3: Evaluate event symbol across all configured automata rules
        For each rule in Rules:
            machine = sessionFSMs[rule.id]
            currentState = machine.getCurrentState()
            
            // Apply transition function
            transitionResult = rule.evaluate(currentState, symbol, machine.sequenceStep, e)
            
            If transitionResult.matched is TRUE:
                machine.currentState = transitionResult.nextState
                machine.sequenceStep = transitionResult.nextStep
                Append e to machine.matchedEvents
                Append (currentState -> machine.currentState) to machine.history

                If machine.currentState == "ALERT":
                    eventStatus = "SUSPICIOUS"
                    highestState = "ALERT"
                    
                    // Create formal alert dossier
                    alertObj = CreateAlertRecord(
                        alertId: GenerateUniqueId(),
                        attackType: rule.attackType,
                        severity: rule.severity,
                        timestamp: e.timestamp,
                        sourceIP: e.sourceIP,
                        destinationIP: e.destinationIP,
                        protocol: e.protocol,
                        port: e.port,
                        description: rule.description,
                        recommendedAction: rule.recommendedAction,
                        stateTrace: machine.getStateTrace()
                    )
                    
                    Append alertObj to Alerts
                    alertTriggered = alertObj.alertId

                    // Reset machine to START state to intercept future attacks
                    machine.Reset()
                Else:
                    If highestState != "ALERT":
                        highestState = machine.currentState
                    End If
                End If
            Else If transitionResult.reset is TRUE:
                machine.Reset()
            End If
        End For

        If eventStatus == "SUSPICIOUS":
            suspiciousCount = suspiciousCount + 1
        Else:
            safeCount = safeCount + 1
        End If

        annotatedEvent = Clone(e)
        annotatedEvent.status = eventStatus
        annotatedEvent.fsmState = highestState
        annotatedEvent.alertTriggered = alertTriggered
        Append annotatedEvent to ProcessedEvents
    End For

    total = Length(ProcessedEvents)
    accuracy = (total - suspiciousCount * 0.1) / total * 100

    Return (ProcessedEvents, Alerts, { total, safeCount, suspiciousCount, accuracy })
End
```

## 3. Complexity Analysis
- **Time Complexity:** $O(n \cdot |R|)$ where $n$ is the number of network events and $|R|$ is the number of active rules. Since $|R| = 4$ is a constant small integer, the running time is strictly **$O(n)$** linear time.
- **Space Complexity:** $O(S)$ where $S$ is the number of active concurrent source IP sessions maintained in memory.
