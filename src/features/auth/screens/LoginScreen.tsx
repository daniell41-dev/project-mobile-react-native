import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { z } from 'zod';

import { AuthStackParamList } from '@/bootstrap/navigation/types';
import { useAuthStore } from '@/core/stores/auth.store';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { Screen } from '@/shared/components/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { fontFamily, fontSize } from '@/theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const loginSchema = z.object({
  email: z.string().min(1, 'Ingresa tu correo').email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginScreen({ navigation }: Props) {
  const theme = useTheme();
  const login = useAuthStore((state) => state.login);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async ({ email, password }: LoginFormValues) => {
    setSubmitError(null);
    try {
      await login(email, password);
    } catch {
      setSubmitError('No se pudo iniciar sesión. Intenta de nuevo.');
    }
  };

  return (
    <Screen>
      {navigation.canGoBack() && (
        <Pressable
          onPress={navigation.goBack}
          hitSlop={8}
          style={styles.backButton}
          accessibilityLabel="Atrás"
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>
      )}

      <AppText variant="screenTitle" style={styles.title}>
        Entrar
      </AppText>

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur } }) => (
          <View style={styles.field}>
            <AppText variant="subtitle" tone="textDim" style={styles.label}>
              Correo
            </AppText>
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="tu@correo.mx"
              placeholderTextColor={theme.colors.textMute}
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface2,
                  borderRadius: theme.radii.sm,
                },
              ]}
            />
            {errors.email && (
              <AppText variant="label" tone="down" style={styles.errorText}>
                {errors.email.message}
              </AppText>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <View style={styles.field}>
            <AppText variant="subtitle" tone="textDim" style={styles.label}>
              Contraseña
            </AppText>
            <View style={styles.passwordRow}>
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                autoComplete="password"
                secureTextEntry={!passwordVisible}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textMute}
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.surface2,
                    borderRadius: theme.radii.sm,
                  },
                ]}
              />
              <Pressable
                onPress={() => setPasswordVisible((visible) => !visible)}
                style={styles.eyeButton}
                accessibilityLabel={
                  passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                <Ionicons
                  name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.colors.textDim}
                />
              </Pressable>
            </View>
            {errors.password && (
              <AppText variant="label" tone="down" style={styles.errorText}>
                {errors.password.message}
              </AppText>
            )}
          </View>
        )}
      />

      <Pressable hitSlop={8} style={styles.forgotPassword}>
        <AppText variant="subtitle" tone="accent">
          ¿Olvidaste tu contraseña?
        </AppText>
      </Pressable>

      {submitError && (
        <AppText variant="label" tone="down" style={styles.errorText}>
          {submitError}
        </AppText>
      )}

      {isSubmitting ? (
        <ActivityIndicator color={theme.colors.accent} />
      ) : (
        <Button label="Entrar" onPress={handleSubmit(onSubmit)} />
      )}

      <View style={styles.separatorRow}>
        <View style={[styles.separatorLine, { backgroundColor: theme.colors.hairline }]} />
        <AppText variant="label" tone="textMute">
          o continúa con
        </AppText>
        <View style={[styles.separatorLine, { backgroundColor: theme.colors.hairline }]} />
      </View>

      <View style={styles.socialRow}>
        <Pressable
          style={[
            styles.socialButton,
            { backgroundColor: theme.colors.surface2, borderRadius: theme.radii.md },
          ]}
        >
          <Ionicons name="logo-apple" size={18} color={theme.colors.text} />
          <AppText variant="subtitle">Apple</AppText>
        </Pressable>
        <Pressable
          style={[
            styles.socialButton,
            { backgroundColor: theme.colors.surface2, borderRadius: theme.radii.md },
          ]}
        >
          <Ionicons name="logo-google" size={18} color={theme.colors.text} />
          <AppText variant="subtitle">Google</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    marginLeft: -10,
  },
  title: {
    marginTop: 8,
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
  },
  input: {
    minHeight: 44,
    paddingHorizontal: 14,
    fontFamily: fontFamily.uiRegular,
    fontSize: fontSize.body,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    minHeight: 44,
    justifyContent: 'center',
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 28,
    marginBottom: 16,
  },
  separatorLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
  },
});
