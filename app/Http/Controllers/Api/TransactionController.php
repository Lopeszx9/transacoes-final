<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TransactionController extends Controller
{
    /**
     * Lista de transações (paginada), mais recentes primeiro.
     * Aceita filtro opcional por status: /api/transactions?status=aprovada
     */
    public function index(Request $request)
    {
        $query = Transaction::query()
            ->with('user')
            ->latest('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $transactions = $query->paginate($request->integer('per_page', 15));

        return TransactionResource::collection($transactions);
    }

    /**
     * Cadastra uma nova transação, com upload opcional do documento comprovante.
     */
    public function store(StoreTransactionRequest $request)
    {
        $data = $request->validated();

        $transaction = new Transaction();
        $transaction->user_id = $request->user()->id;
        $transaction->value = $data['value'];
        $transaction->cpf = preg_replace('/\D/', '', $data['cpf']);
        $transaction->status = $data['status'] ?? \App\Enums\TransactionStatus::EM_PROCESSAMENTO;

        if ($request->hasFile('document')) {
            $file = $request->file('document');
            $transaction->document_path = $file->store('documents', 'public');
            $transaction->document_original_name = $file->getClientOriginalName();
        }

        $transaction->save();

        return (new TransactionResource($transaction->load('user')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Exibe uma transação específica (tela/modal de visualização).
     */
    public function show(Transaction $transaction)
    {
        return new TransactionResource($transaction->load('user'));
    }

    /**
     * Atualiza uma transação existente. Se um novo documento for enviado,
     * o antigo é removido do storage.
     */
    public function update(UpdateTransactionRequest $request, Transaction $transaction)
    {
        $data = $request->validated();

        if (array_key_exists('value', $data)) {
            $transaction->value = $data['value'];
        }

        if (array_key_exists('cpf', $data)) {
            $transaction->cpf = preg_replace('/\D/', '', $data['cpf']);
        }

        if (array_key_exists('status', $data)) {
            $transaction->status = $data['status'];
        }

        if ($request->hasFile('document')) {
            if ($transaction->document_path) {
                Storage::disk('public')->delete($transaction->document_path);
            }

            $file = $request->file('document');
            $transaction->document_path = $file->store('documents', 'public');
            $transaction->document_original_name = $file->getClientOriginalName();
        }

        $transaction->save();

        return new TransactionResource($transaction->load('user'));
    }

    /**
     * Exclusão em soft delete (a transação some da listagem, mas continua no banco).
     */
    public function destroy(Transaction $transaction)
    {
        $transaction->delete();

        return response()->json([
            'message' => 'Transação excluída com sucesso.',
        ]);
    }
}
