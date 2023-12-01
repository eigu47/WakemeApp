import {
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type RefObject,
} from "react";
import { View } from "react-native";

import { create } from "zustand";

type EventType = {
  id: string;
  ref: RefObject<View>;
  callback: (() => void) | null;
  disable: boolean;
};

let skipId: string | undefined = undefined;

const useEventStore = create<{
  events: EventType[];
  addEvent: (event: EventType) => void;
  removeEvent: (ref: RefObject<View>) => void;
}>((set) => ({
  events: [],
  addEvent: (event) =>
    set(({ events }) => ({
      events: [...events, event],
    })),
  removeEvent: (ref) =>
    set(({ events }) => ({ events: events.filter((e) => e.ref !== ref) })),
}));

export function OutsidePressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const events = useEventStore((state) => state.events);

  return (
    <View
      onTouchStart={() => {
        const skipped: string[] = [];
        events.forEach(({ id, callback, disable }) => {
          if (id === skipId || skipped.includes(id) || disable) return;
          callback?.();
          skipped.push(id);
        });
        skipId = undefined;
      }}
      style={{ flex: 1 }}
    >
      {children}
    </View>
  );
}

export function OutsidePress({
  children,
  onOutsidePress: callback,
  disable = false,
  id: sharedId,
  ...props
}: {
  children: React.ReactNode;
  onOutsidePress: (() => void) | null;
  id?: string;
  disable?: boolean;
} & ComponentPropsWithoutRef<typeof View>) {
  const addEvent = useEventStore((state) => state.addEvent);
  const removeEvent = useEventStore((state) => state.removeEvent);
  const ref = useRef<View>(null);

  const uniqueId = useRef(Math.random().toString()).current;
  const id = sharedId ?? uniqueId;

  useEffect(() => {
    addEvent({ id, callback, disable, ref });

    return () => removeEvent(ref);
  }, [callback, id, addEvent, removeEvent, disable]);

  return (
    <View
      {...props}
      ref={ref}
      onTouchStart={(e) => {
        props.onTouchStart?.(e);
        skipId = id;
      }}
    >
      {children}
    </View>
  );
}
