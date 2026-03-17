import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import Colors from '@/constants/colors';

interface Props {
  title?: string;
  snapPoints?: (string | number)[];
  children: React.ReactNode;
  scrollable?: boolean;
  onClose?: () => void;
}

const ThemedBottomSheet = forwardRef<BottomSheet, Props>(
  ({ title, snapPoints: customSnaps, children, scrollable = false, onClose }, ref) => {
    const snapPoints = useMemo(() => customSnaps || ['50%', '80%'], [customSnaps]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
        />
      ),
      []
    );

    const Content = scrollable ? BottomSheetScrollView : BottomSheetView;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onClose={onClose}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.indicator}
      >
        <Content style={styles.content}>
          {title && <Text style={styles.title}>{title}</Text>}
          {children}
        </Content>
      </BottomSheet>
    );
  }
);

ThemedBottomSheet.displayName = 'ThemedBottomSheet';

export default ThemedBottomSheet;

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.bg2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  indicator: {
    backgroundColor: Colors.textMuted,
    width: 40,
  },
  content: {
    padding: 20,
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
});
