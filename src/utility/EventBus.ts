export default {
  emit,
  listen,
  removeListener
};

function emit<T = any>(eventName: string, data?: T) {
  const event = new CustomEvent(eventName, {detail: data});
  window.dispatchEvent(event);
}

function listen<T = any>(eventName: string, func: any): {stopListening: () => void} {
  const customFunc = (data: any) => func(data.detail);
  window.addEventListener(eventName, customFunc);

  return {
    stopListening: () => removeListener(eventName, customFunc)
  };
}

function removeListener(eventName: string, func: any) {
  window.removeEventListener(eventName, func);
}

export enum EventBusEventName {
  TaskWasAddedToRun = 'TaskWasAddedToRun',
  TaskWasRemovedFromRun = 'TaskWasRemovedFromRun',
  TaskWasSnoozed = 'TaskWasSnoozed',
  TaskWasUnsnoozed = 'TaskWasUnsnoozed',
  TaskWasUpdated = 'TaskWasUpdated',
  ContactChangedStatus = 'ContactChangedStatus',
  StaffAssignedToTask = 'StaffAssignedToTask',
  VehicleAssignedToTask = 'VehicleAssignedToTask'
}
