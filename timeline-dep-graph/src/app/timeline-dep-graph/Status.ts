/**
 * Status represents the statuses that a task can have.
 * The statuses are ordered by priority. For example in the provided
 * statuses below, FAILED has the highest priority and SUCCESS
 * has the lowest priority.
 * Thus if tasks are grouped, FAILED tasks will be in the most upper group level
 * and SUCCESS tasks will be in the lowest group level.
 *
 * If more Statuses are needed, please add them below and add their
 * associated styling in the `styles.scss` or in your global styling file.
 * For every new status add two classes:
 *
 * rect.tdg-(status value) {
 *  fill: (status color);
 * }
 *
 * small.tdg-(status value) {
 *  color: (status color);
 * }
 *
 * For example, adding an `ACTION_REQUIRED = action_required` status.
 * Their styling could be:
 * ```
 * rect.tdg-action_required {
 *  fill: orange;
 * }
 *
 * small.tdg-action_required {
 *  color: orange;
 * }
 */
export enum Status {
  FAILED = 'failed',
  BLOCKED = 'blocked',
  UNKNOWN = 'unknown',
  RUNNING = 'running',
  SUCCESS = 'success',
}
