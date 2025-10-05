#include "httplib.h"
#include <iostream>
#include <fstream>
#include <string>
#include "json.hpp" 

using json = nlohmann::json;
using namespace httplib;

int count_words(const std::string& text) {
    std::istringstream iss(text);
    std::string word;
    int count = 0;
    while (iss >> word) count++;
    return count;
}

int main() {
    Server svr;

    svr.Post("/count-words", [](const Request& req, Response& res) {
        try {
            auto body = json::parse(req.body);
            std::string text = body["text"];
            int word_count = count_words(text);

            json response = {
                {"word_count", word_count}
            };

            std::cout << "Texto recebido: \"" << text
                      << "\" - Palavras: " << word_count << std::endl;

            res.set_content(response.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content("{\"error\":\"Requisição inválida\"}", "application/json");
        }
    });

    std::cout << "Microserviço A (REST) rodando em http://0.0.0.0:6001 ..." << std::endl;
    svr.listen("0.0.0.0", 6001);

    return 0;
}
