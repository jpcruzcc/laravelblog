<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PostResource\Pages;
use App\Models\Post;
use Filament\Forms;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Get;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class PostResource extends Resource
{
    protected static ?string $model = Post::class;

    protected static ?string $navigationIcon = 'heroicon-o-newspaper';

    protected static ?string $navigationGroup = 'Content';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Conteudo do Post')
                    ->columns(2)
                    ->schema([
                        TextInput::make('title')
                            ->label('Titulo')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn (Forms\Set $set, ?string $state) => $set('slug', Str::slug((string) $state))),
                        TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        Textarea::make('excerpt')
                            ->label('Resumo')
                            ->rows(3)
                            ->columnSpanFull(),
                        RichEditor::make('content')
                            ->label('Conteudo')
                            ->required()
                            ->fileAttachmentsDisk('public')
                            ->fileAttachmentsDirectory('posts/content')
                            ->columnSpanFull(),
                        Forms\Components\FileUpload::make('featured_image')
                            ->label('Imagem de destaque')
                            ->image()
                            ->directory('posts/featured')
                            ->disk('public')
                            ->imageEditor(),
                    ]),
                Section::make('Publicacao')
                    ->columns(2)
                    ->schema([
                        Select::make('type')
                            ->label('Tipo')
                            ->required()
                            ->options([
                                'review' => 'Review',
                                'news' => 'Noticia',
                            ])
                            ->native(false)
                            ->live(),
                        Select::make('category')
                            ->label('Categoria')
                            ->required()
                            ->options([
                                'movies' => 'Filmes',
                                'series' => 'Series',
                                'geek' => 'Geek',
                            ])
                            ->native(false),
                        Select::make('status')
                            ->required()
                            ->default('draft')
                            ->options([
                                'draft' => 'Rascunho',
                                'published' => 'Publicado',
                            ])
                            ->native(false)
                            ->live()
                            ->afterStateUpdated(function (Forms\Set $set, ?string $state): void {
                                if ($state === 'published') {
                                    $set('published_at', now());
                                }
                            }),
                        DateTimePicker::make('published_at')
                            ->label('Data de publicacao')
                            ->seconds(false)
                            ->required(fn (Get $get): bool => $get('status') === 'published'),
                        TextInput::make('rating')
                            ->label('Nota')
                            ->numeric()
                            ->minValue(1)
                            ->maxValue(5)
                            ->visible(fn (Get $get): bool => $get('type') === 'review'),
                        Forms\Components\Toggle::make('is_featured')
                            ->label('Destaque no slider')
                            ->default(false),
                        Forms\Components\Toggle::make('spoiler_alert')
                            ->label('Contem spoiler')
                            ->default(false),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->limit(45),
                TextColumn::make('type')
                    ->badge()
                    ->color(fn (string $state): string => $state === 'review' ? 'warning' : 'info')
                    ->formatStateUsing(fn (string $state): string => $state === 'review' ? 'Review' : 'Noticia'),
                TextColumn::make('category')
                    ->badge()
                    ->color('gray'),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => $state === 'published' ? 'success' : 'gray')
                    ->formatStateUsing(fn (string $state): string => $state === 'published' ? 'Publicado' : 'Rascunho'),
                TextColumn::make('rating')
                    ->label('Nota')
                    ->sortable(),
                IconColumn::make('is_featured')
                    ->label('Destaque')
                    ->boolean(),
                IconColumn::make('spoiler_alert')
                    ->label('Spoiler')
                    ->boolean(),
                TextColumn::make('published_at')
                    ->label('Publicado em')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'review' => 'Review',
                        'news' => 'Noticia',
                    ]),
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Rascunho',
                        'published' => 'Publicado',
                    ]),
                Tables\Filters\TernaryFilter::make('is_featured')
                    ->label('Em destaque'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPosts::route('/'),
            'create' => Pages\CreatePost::route('/create'),
            'edit' => Pages\EditPost::route('/{record}/edit'),
        ];
    }
}
