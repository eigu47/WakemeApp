import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { Pressable } from "react-native";

type EventType = {
  id: string;
  callback: () => void;
  disable: boolean;
};

type ContextType = {
  events?: EventType[];
  addEvent?: (event: EventType) => void;
  removeEvent?: (id: string) => void;
  skipId?: string | undefined;
  setSkipId?: (id: string | undefined) => void;
};

export const EventContext = createContext<ContextType>({});

export function OutsidePressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [events, setEvents] = useState<EventType[]>([]);
  const [skipId, setSkipId] = useState<string | undefined>(undefined);

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
        skipId,
        setSkipId,
        addEvent,
        removeEvent,
      }}
    >
      <Pressable
        onPressIn={() => {
          let skipped = false;
          events.forEach(({ id, disable, callback }) => {
            if (id === skipId || disable) return;

            callback();
            skipped = true;
          });

          skipped && setSkipId(undefined);
        }}
        style={{ flex: 1 }}
      >
        {children}
      </Pressable>
    </EventContext.Provider>
  );
}

export function OutsidePress({
  children,
  onOutsidePress,
  disable = false,
  ...props
}: {
  children: React.ReactNode;
  onOutsidePress: () => void;
  disable?: boolean;
} & ComponentProps<typeof Pressable>) {
  const { addEvent, removeEvent, setSkipId } = useContext(EventContext);
  const id = useRef(Math.random().toString()).current;

  useEffect(() => {
    addEvent?.({ id, callback: onOutsidePress, disable });

    return () => removeEvent?.(id);
  }, [onOutsidePress, id, disable, addEvent, removeEvent]);

  return (
    <Pressable
      {...props}
      onPressIn={(e) => {
        props.onPressIn?.(e);
        setSkipId?.(id);
      }}
    >
      {children}
    </Pressable>
  );
}
