import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { Eventizer, EventMap } from './Eventizer';

/**
 * Type for the context value that includes both the eventizer instance and its type
 */
type EventizerContextValue<EM extends Record<string, any> = any> = {
  bus: Eventizer<EM>;
};

/**
 * React context for the Eventizer instance.
 * Uses a generic type parameter to allow for custom event maps.
 */
const EventizerContext = createContext<EventizerContextValue | null>(null);

/**
 * Props for the EventizerProvider component.
 */
interface EventizerProviderProps<EM extends Record<string, any>> {
  /**
   * The Eventizer instance to provide to the React component tree.
   */
  bus: Eventizer<EM>;
  
  /**
   * React children.
   */
  children: ReactNode;
}

/**
 * Provider component that makes an Eventizer instance available to all
 * descendant components via React context.
 */
export const EventizerProvider = <EM extends Record<string, any>>({ 
  bus, 
  children 
}: EventizerProviderProps<EM>) => (
  <EventizerContext.Provider value={{ bus }}>
    {children}
  </EventizerContext.Provider>
);

/**
 * Hook to access the Eventizer instance from React context.
 * 
 * @returns The Eventizer instance
 * @throws Error if used outside of an EventizerProvider
 */
export const useEventizer = <EM extends Record<string, any> = EventMap>(): Eventizer<EM> => {
  const context = useContext(EventizerContext);
  if (!context) {
    throw new Error('useEventizer must be used within an EventizerProvider');
  }
  return context.bus as Eventizer<EM>;
};

/**
 * Hook to subscribe to an event and automatically unsubscribe on component unmount.
 * 
 * @param event - The event name to subscribe to
 * @param callback - The callback function to be called when the event is emitted
 * @param deps - Optional dependency array for the callback (similar to useEffect deps)
 */
export function useSubscribe<K extends string>(
  event: K,
  callback: (payload: any) => void,
  deps: any[] = []
): void {
  const bus = useEventizer();
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const unsubscribe = bus.on(event as any, callback);
    return () => {
      unsubscribe();
    };
  }, [bus, event, ...deps]);
}

/**
 * Hook to create an event emitter function for a specific event.
 * 
 * @param event - The event name to create an emitter for
 * @returns A function that emits the event with the provided payload
 */
export function useEmitter<K extends string>(
  event: K
): (payload?: any) => void {
  const bus = useEventizer();
  return (payload?: any) => bus.emit(event as any, payload === undefined ? undefined : payload);
} 