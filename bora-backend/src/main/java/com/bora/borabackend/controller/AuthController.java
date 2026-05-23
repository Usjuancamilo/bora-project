package com.bora.borabackend.controller;


import org.springframework.web.bind.annotation.*;

import javax.security.auth.login.LoginContext;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")

public class AuthController {

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request){
        //Spring security valida automaticamente con httpBasic
        return "{\"message\":\"Login exitoso\"}";

    }
}

    class LoginRequest {
        public String username;
        public String password;
    }
