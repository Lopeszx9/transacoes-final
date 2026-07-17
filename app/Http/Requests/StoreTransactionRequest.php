<?php

namespace App\Http\Requests;

use App\Enums\TransactionStatus;
use App\Rules\CpfValido;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'value' => ['required', 'numeric', 'min:0.01'],
            'cpf' => ['required', 'string', new CpfValido],
            'status' => ['sometimes', Rule::in(TransactionStatus::values())],
            // Documento comprovante
            'document' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'value.required' => 'Informe o valor da transação.',
            'value.numeric' => 'O valor da transação deve ser numérico.',
            'value.min' => 'O valor da transação deve ser maior que zero.',
            'cpf.required' => 'Informe o CPF do portador da transação.',
            'document.mimes' => 'O documento deve ser um PDF ou uma imagem (jpg, jpeg, png).',
            'document.max' => 'O documento deve ter no máximo 5MB.',
        ];
    }
}
