import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { AuthStackParamList } from '@/bootstrap/navigation/types';
import { useAuthStore } from '@/core/stores/auth.store';
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

export function LoginScreen(_props: Props) {
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
    <Screen style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Entrar</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur } }) => (
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textDim }]}>Correo</Text>
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
              <Text style={[styles.errorText, { color: theme.colors.down }]}>
                {errors.email.message}
              </Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textDim }]}>Contraseña</Text>
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
              <Text style={[styles.errorText, { color: theme.colors.down }]}>
                {errors.password.message}
              </Text>
            )}
          </View>
        )}
      />

      {submitError && (
        <Text style={[styles.errorText, { color: theme.colors.down }]}>{submitError}</Text>
      )}

      {isSubmitting ? (
        <ActivityIndicator color={theme.colors.accent} />
      ) : (
        <Button label="Entrar" onPress={handleSubmit(onSubmit)} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    fontFamily: fontFamily.uiBold,
    fontSize: fontSize.screenTitle,
    textAlign: 'center',
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: fontSize.subtitle,
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
    fontFamily: fontFamily.uiRegular,
    fontSize: fontSize.label,
    marginTop: 4,
  },
});
