/** Runs a reversible, ordered set of 3D transitions without reloading the scene. */
export function createGuidedSequence({ transitions, runTransition, onStateChange = () => {} }) {
  let cursor = 0
  let busy = false

  const snapshot = () => ({ cursor, busy, length: transitions.length, atStart: cursor === 0, atEnd: cursor === transitions.length })
  const publish = () => onStateChange(snapshot())
  const run = async (transition, direction) => {
    const result = await runTransition(transition, direction)
    return result !== false && result?.ok !== false
  }

  async function withLock(operation) {
    if (busy) return false
    busy = true
    publish()
    try {
      return await operation()
    } finally {
      busy = false
      publish()
    }
  }

  return {
    next() {
      if (busy || cursor >= transitions.length) return Promise.resolve(false)
      return withLock(async () => {
        if (!await run(transitions[cursor], 'forward')) return false
        cursor += 1
        publish()
        return true
      })
    },
    previous() {
      if (busy || cursor === 0) return Promise.resolve(false)
      return withLock(async () => {
        if (!await run(transitions[cursor - 1], 'reverse')) return false
        cursor -= 1
        publish()
        return true
      })
    },
    replay() {
      if (busy || cursor === 0) return Promise.resolve(false)
      return withLock(async () => {
        const transition = transitions[cursor - 1]
        if (!await run(transition, 'reverse')) return false
        // Reconcile the cursor with the rendered state only if the second leg
        // fails. During a successful replay, keep the selected step stable.
        if (!await run(transition, 'forward')) {
          cursor -= 1
          publish()
          return false
        }
        return true
      })
    },
    reset() {
      if (busy || cursor === 0) return Promise.resolve(false)
      return withLock(async () => {
        while (cursor > 0) {
          if (!await run(transitions[cursor - 1], 'reverse')) return false
          cursor -= 1
          publish()
        }
        return true
      })
    },
    get state() { return snapshot() },
  }
}
