package com.bora.borabackend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class AuthController {

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request){
        return "{\"message\":\"Login exitoso\"}";
    }
}

class LoginRequest {
    public String username;
    public String password;
}