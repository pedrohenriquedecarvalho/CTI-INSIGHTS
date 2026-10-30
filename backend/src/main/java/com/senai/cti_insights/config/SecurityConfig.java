
package com.senai.cti_insights.config;

import com.senai.cti_insights.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    // Criptografia das senhas
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Evita registrar o filtro JWT duas vezes
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> desabilitarRegistroAutomaticoJwt(
            JwtAuthenticationFilter filtro) {

        FilterRegistrationBean<JwtAuthenticationFilter> registro =
                new FilterRegistrationBean<>(filtro);

        registro.setEnabled(false);

        return registro;
    }

    // Configuração CORS para permitir o acesso do Vue
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:5173"
        ));

        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type"
        ));

        config.setExposedHeaders(List.of(
                "Authorization"
        ));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    // Configuração principal do Spring Security
    @Bean
    public SecurityFilterChain filtro(
            HttpSecurity http,
            JwtAuthenticationFilter jwtFilter) throws Exception {

        return http

                // CORS
                .cors(Customizer.withDefaults())

                // API REST com JWT
                .csrf(csrf -> csrf.disable())

                // Desabilita login padrão do Spring
                .formLogin(login -> login.disable())

                // Desabilita autenticação HTTP Basic
                .httpBasic(basic -> basic.disable())

                // Não utiliza sessões
                .sessionManagement(sessao ->
                        sessao.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // Tratamento de erros
                .exceptionHandling(ex -> ex

                        .authenticationEntryPoint((req, res, erro) ->
                                res.sendError(
                                        HttpServletResponse.SC_UNAUTHORIZED
                                )
                        )

                        .accessDeniedHandler((req, res, erro) ->
                                res.sendError(
                                        HttpServletResponse.SC_FORBIDDEN
                                )
                        )
                )

                // Regras de autorização
                .authorizeHttpRequests(auth -> auth

                        // Permite requisições CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Rotas públicas
                        .requestMatchers("/error").permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/cadastro",
                                "/api/auth/login"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/publico"
                        ).permitAll()

                        // Somente ADMIN acessa rotas administrativas
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Somente ADMIN pode excluir clientes
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/clientes/**"
                        ).hasRole("ADMIN")

                        // Todas as demais rotas exigem autenticação
                        .anyRequest().authenticated()
                )

                // Executa o filtro JWT antes da autenticação padrão
                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .build();
    }
}
