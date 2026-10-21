import * as Device from 'expo-device';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import {Button } from '@/components/ui/button'
import {Text } from '@/components/ui/text'
import { useRouter } from 'expo-router';


export default function HomeScreen() {
  const router = useRouter();
  return (
    <ThemedView > {/*1*/}
      
    <ThemedView style={styles.welcomeSection}> {/*2*/}
      <ThemedText style={styles.appTitle}>
        Job Application Tracker
      </ThemedText>

      <ThemedText style={styles.heading}>
        Your next opportunity starts here.
      </ThemedText>

      <ThemedText style={styles.description}>
        Keep your job applications organised, track your
        progress and stay ready for your next opportunity.
      </ThemedText>
      $nbsp;
      &nbsp;

     
     <ThemedView style={styles.featureCard}> {/*3*/}
     <ThemedText style={styles.featureTitle}>
       Keep your job search organised
     </ThemedText>

     <ThemedText style={styles.featureDescription}>
      ✓ Track your applications{"\n"}
      ✓ Prepare for interviews{"\n"}
      ✓ Remember your follow-ups
     </ThemedText>
    </ThemedView> {/*3*/}
    </ThemedView> {/*2*/}

      <Button onPress={() => router.push('/signin')}>
        <Text>Sign In</Text>
      </Button>
      <Button onPress={() => router.push('/signup')}>
        <Text>Sign Up</Text>
      </Button>

      <ThemedText>Made by Ashley Ashirai Hlatshwayo of GHOSTTECH.Ashirai</ThemedText>
    </ThemedView> /*1*/  );
}

const styles = StyleSheet.create({
  welcomeSection: {
    padding: 20,
    marginBottom: 24,
  },

  appTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
  },

  heading: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 39,
    marginBottom: 12,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },

  featureCard: {
  backgroundColor: '#EEF1FF',
  padding: 20,
  marginHorizontal: 20,
  marginBottom: 24,
  borderRadius: 16,
},

featureTitle: {
  fontSize: 18,
  fontWeight: '700',
  marginBottom: 12,
  color: '#233B83',
},

featureDescription: {
  fontSize: 15,
  lineHeight: 28,
  color: '#536078',
},
}
);

