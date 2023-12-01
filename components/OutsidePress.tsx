import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { View } from "react-native";

type EventType = {
  id: string;
  callback: (() => void) | null;
  disable: boolean;
};

declare global {
  // eslint-disable-next-line no-var
  var skipEventId: string | undefined;
}

export const EventContext = createContext<{
  events: EventType[];
  addEvent: (event: EventType) => void;
  removeEvent: (id: string) => void;
  setSkipId: (id: string | undefined) => void;
}>({
  events: [],
  addEvent: () => {},
  removeEvent: () => {},
  setSkipId: () => {},
});

export function OutsidePressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [events, setEvents] = useState<EventType[]>([]);
  function setSkipId(id?: string) {
    global.skipEventId = id;
  }

  const addEvent = useCallback((event: EventType) => {
    setEvents((prev) => [...prev, event]);
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <EventContext.Provider
      value={{
        events,
        setSkipId,
        addEvent,
        removeEvent,
      }}
    >
      <View
        onTouchStart={() => {
          const skipId = global.skipEventId;
          // const skipped: string[] = [];
          events.forEach(({ id, callback, disable }) => {
            if (id === skipId || disable) return;

            callback?.();
            // skipped.push(id);
          });
          if (skipId) setSkipId(undefined);
        }}
        style={{ flex: 1 }}
      >
        {children}
      </View>
    </EventContext.Provider>
  );
}

export function OutsidePress({
  children,
  onOutsidePress,
  disable = false,
  id: sharedId,
  ...props
}: {
  children: React.ReactNode;
  onOutsidePress: (() => void) | null;
  id?: string;
  disable?: boolean;
} & ComponentProps<typeof View>) {
  const { addEvent, removeEvent, setSkipId } = useContext(EventContext);
  const uniqueId = useRef(Math.random().toString()).current;

  const id = sharedId ?? uniqueId;

  useEffect(() => {
    addEvent({ id, callback: onOutsidePress, disable });

    return () => removeEvent(id);
  }, [onOutsidePress, id, addEvent, removeEvent, disable]);

  return (
    <View
      {...props}
      onTouchStart={(e) => {
        props.onTouchStart?.(e);
        setSkipId(id);
      }}
    >
      {children}
    </View>
  );
}
