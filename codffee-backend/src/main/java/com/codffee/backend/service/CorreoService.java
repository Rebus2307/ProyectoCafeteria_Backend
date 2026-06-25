package com.codffee.backend.service;

import com.codffee.backend.exception.SolicitudInvalidaException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class CorreoService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String correoRemitente;

    public CorreoService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public boolean enviarCorreoSimple(String destinatario, String asunto, String mensaje) {
        try {
            SimpleMailMessage correo = new SimpleMailMessage();

            correo.setFrom(correoRemitente);
            correo.setTo(destinatario);
            correo.setSubject(asunto);
            correo.setText(mensaje);

            javaMailSender.send(correo);
            return true;
        } catch (MailException e) {
            System.err.println("Error enviando correo a [" + destinatario + "]: " + e.getMessage());
            return false;
        }
    }
}